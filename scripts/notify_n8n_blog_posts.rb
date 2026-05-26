#!/usr/bin/env ruby

require 'date'
require 'json'
require 'net/http'
require 'open3'
require 'uri'
require 'yaml'

ROOT = File.expand_path('..', __dir__)
CONFIG_PATH = File.join(ROOT, '_config.yml')

def run_command(*command)
  stdout, stderr, status = Open3.capture3(*command, chdir: ROOT)
  return stdout if status.success?

  warn(stderr.strip) unless stderr.strip.empty?
  abort("Command failed: #{command.join(' ')}")
end

def changed_post_paths
  manual_path = ENV.fetch('INPUT_POST_PATH', '').strip
  return [manual_path] unless manual_path.empty?

  event_name = ENV.fetch('GITHUB_EVENT_NAME', '')
  return [] unless event_name == 'push'

  before_sha = ENV.fetch('GITHUB_EVENT_BEFORE', '').strip
  after_sha = ENV.fetch('GITHUB_SHA', '').strip

  diff_output =
    if before_sha.empty? || before_sha.match?(/\A0+\z/)
      run_command('git', 'diff-tree', '--no-commit-id', '--name-only', '-r', after_sha, '--', '_posts')
    else
      run_command('git', 'diff', '--name-only', before_sha, after_sha, '--', '_posts')
    end

  diff_output
    .lines
    .map(&:strip)
    .grep(/\A_posts\/.+\.md\z/)
    .uniq
end

def load_yaml(path)
  YAML.safe_load(File.read(path, mode: 'r:bom|utf-8').scrub, permitted_classes: [Date, Time], aliases: true) || {}
end

def load_front_matter(path)
  content = File.read(path, mode: 'r:bom|utf-8').scrub
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  return {} unless match

  YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
end

def normalize_site_base(config)
  base = config.fetch('url', '').to_s.strip
  abort('Missing `url` in _config.yml.') if base.empty?

  baseurl = config.fetch('baseurl', '').to_s.strip
  [base.sub(%r{/+\z}, ''), baseurl.sub(%r{/+\z}, '')].join
end

def derive_slug(path, data)
  explicit_slug = data.fetch('slug', '').to_s.strip
  return explicit_slug unless explicit_slug.empty?

  File.basename(path, '.md').sub(/\A\d{4}-\d{2}-\d{2}-/, '')
end

def normalize_permalink(data, slug)
  permalink = data.fetch('permalink', '').to_s.strip
  permalink = "/blog/#{slug}/" if permalink.empty?
  permalink = "/#{permalink}" unless permalink.start_with?('/')
  return permalink if File.extname(permalink) == '.html'

  permalink.end_with?('/') ? permalink : "#{permalink}/"
end

def normalize_asset_url(site_base, raw_url)
  value = raw_url.to_s.strip
  return nil if value.empty?
  return value if value.start_with?('http://', 'https://')

  value = "/#{value}" unless value.start_with?('/')
  "#{site_base}#{value}"
end

def escape_url_path(path)
  path.split('/').map { |segment| URI.encode_www_form_component(segment) }.join('/')
end

def git_remote_repository
  remote = run_command('git', 'config', '--get', 'remote.origin.url').strip
  match = remote.match(%r{github\.com[:/](.+?)(?:\.git)?\z})
  match ? match[1] : ''
rescue SystemExit
  ''
end

def normalize_raw_asset_url(raw_url)
  value = raw_url.to_s.strip
  return nil if value.empty?
  return value if value.start_with?('http://', 'https://')

  repository = ENV.fetch('GITHUB_REPOSITORY', '').strip
  repository = git_remote_repository if repository.empty?
  repository = 'willylondon/lifestyle-hikers' if repository.empty?

  revision = ENV.fetch('GITHUB_SHA', '').strip
  revision = ENV.fetch('GITHUB_REF_NAME', '').strip if revision.empty?
  revision = 'main' if revision.empty?

  path = value.sub(%r{\A/+}, '')
  "https://raw.githubusercontent.com/#{repository}/#{revision}/#{escape_url_path(path)}"
end

def normalize_list(value)
  case value
  when Array
    value.map(&:to_s).map(&:strip).reject(&:empty?)
  when String
    value.split(',').map(&:strip).reject(&:empty?)
  else
    []
  end
end

def published_post?(data)
  return false if data['published'] == false

  date_value = data['date']
  return true if date_value.nil?

  published_on =
    case date_value
    when Date
      date_value
    when Time
      date_value.to_date
    else
      Date.parse(date_value.to_s)
    end

  published_on <= Date.today
rescue Date::Error
  true
end

def html_escape(text)
  text.to_s
      .gsub('&', '&amp;')
      .gsub('<', '&lt;')
      .gsub('>', '&gt;')
      .gsub('"', '&quot;')
end

def build_telegram_caption(post)
  lines = []
  lines << '<b>New blog post from Lifestyle Hikers</b>'
  lines << ''
  lines << "<b>#{html_escape(post[:title])}</b>"
  lines << html_escape(post[:description]) unless post[:description].empty?
  lines << ''
  lines << %(<a href="#{html_escape(post[:url])}">Read the blog</a>)

  caption = lines.join("\n")
  return caption if caption.length <= 1024

  short_description = post[:description][0, 220].to_s.strip
  short_description = "#{short_description}..." if post[:description].length > short_description.length

  compact_lines = []
  compact_lines << '<b>New blog post from Lifestyle Hikers</b>'
  compact_lines << ''
  compact_lines << "<b>#{html_escape(post[:title])}</b>"
  compact_lines << html_escape(short_description) unless short_description.empty?
  compact_lines << ''
  compact_lines << %(<a href="#{html_escape(post[:url])}">Read the blog</a>)
  compact_lines.join("\n")
end

def build_posts
  config = load_yaml(CONFIG_PATH)
  site_base = normalize_site_base(config)

  changed_post_paths.filter_map do |relative_path|
    absolute_path = File.join(ROOT, relative_path)
    next unless File.file?(absolute_path)

    data = load_front_matter(absolute_path)
    next unless published_post?(data)

    slug = derive_slug(relative_path, data)
    permalink = normalize_permalink(data, slug)
    title = data.fetch('title', slug.tr('-', ' ')).to_s.strip
    description = data.fetch('description', '').to_s.strip
    url = "#{site_base}#{permalink}"
    site_image_url = normalize_asset_url(site_base, data['image'])
    raw_image_url = normalize_raw_asset_url(data['image'])
    date = data.fetch('date', '').to_s

    {
      source: 'lifestyle-hikers-cms',
      event: 'blog_published',
      content_type: 'blog',
      contentType: 'blog',
      announcement_id: "blog:#{slug}",
      post_path: relative_path,
      title: title,
      slug: slug,
      description: description,
      url: url,
      link: url,
      image_url: raw_image_url,
      image: raw_image_url,
      flyer_url: raw_image_url,
      flyer: raw_image_url,
      site_image_url: site_image_url,
      image_path: data['image'].to_s.strip,
      date: date,
      author: data.fetch('author', 'Lifestyle Hikers').to_s,
      category: data.fetch('category', '').to_s,
      tags: normalize_list(data['tags']),
      channels: ['telegram'],
      telegram: true,
      send_telegram: true,
      sendTelegram: true,
      brevo: false,
      send_brevo: false,
      sendBrevo: false,
      send_to_telegram: true,
      send_to_brevo: false,
      distribution_status: 'ready',
      telegram_caption: nil,
      source_commit_sha: ENV.fetch('GITHUB_SHA', ''),
      github: {
        repository: ENV.fetch('GITHUB_REPOSITORY', ''),
        sha: ENV.fetch('GITHUB_SHA', ''),
        ref: ENV.fetch('GITHUB_REF', '')
      }
    }.tap do |payload|
      payload[:telegram_caption] = build_telegram_caption(payload)
    end
  end
end

def post_to_n8n(webhook_url, payload)
  uri = URI(webhook_url)
  request = Net::HTTP::Post.new(uri)
  request['Content-Type'] = 'application/json'

  shared_secret = ENV.fetch('N8N_WEBHOOK_SECRET', '').strip
  request['x-lh-secret'] = shared_secret unless shared_secret.empty?

  request.body = JSON.generate(payload)

  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
    http.request(request)
  end

  return if response.is_a?(Net::HTTPSuccess)

  abort("n8n webhook error: #{response.code} #{response.message} #{response.body}")
end

posts = build_posts

if posts.empty?
  puts 'No published blog posts changed, skipping n8n notification.'
  exit 0
end

if ENV.fetch('DRY_RUN', '').strip == '1'
  puts JSON.pretty_generate(posts)
  exit 0
end

webhook_url = ENV.fetch('N8N_CONTENT_WEBHOOK_URL') do
  abort('Missing N8N_CONTENT_WEBHOOK_URL secret.')
end

posts.each do |payload|
  post_to_n8n(webhook_url, payload)
  puts "Sent n8n content notification for #{payload[:url]}"
end
