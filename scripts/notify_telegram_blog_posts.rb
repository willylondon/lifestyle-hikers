#!/usr/bin/env ruby

require 'cgi'
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
    image_url = normalize_asset_url(site_base, data['image'])

    {
      title: title,
      description: description,
      url: "#{site_base}#{permalink}",
      image_url: image_url
    }
  end
end

def telegram_api_uri(bot_token, method_name)
  URI("https://api.telegram.org/bot#{bot_token}/#{method_name}")
end

def build_message(post)
  lines = []
  lines << '<b>New blog post from Lifestyle Hikers</b>'
  lines << ''
  lines << "<b>#{CGI.escapeHTML(post[:title])}</b>"
  lines << CGI.escapeHTML(post[:description]) unless post[:description].empty?
  lines << ''
  lines << %(<a href="#{CGI.escapeHTML(post[:url])}">Read the blog</a>)
  lines.join("\n")
end

def build_photo_caption(post)
  lines = []
  lines << '<b>New blog post from Lifestyle Hikers</b>'
  lines << ''
  lines << "<b>#{CGI.escapeHTML(post[:title])}</b>"
  lines << CGI.escapeHTML(post[:description]) unless post[:description].empty?
  lines << ''
  lines << %(<a href="#{CGI.escapeHTML(post[:url])}">Read the blog</a>)

  caption = lines.join("\n")
  return caption if caption.length <= 1024

  fallback_description = post[:description][0, 220].to_s.strip
  fallback_description = "#{fallback_description}..." if post[:description].to_s.length > fallback_description.length

  compact_lines = []
  compact_lines << '<b>New blog post from Lifestyle Hikers</b>'
  compact_lines << ''
  compact_lines << "<b>#{CGI.escapeHTML(post[:title])}</b>"
  compact_lines << CGI.escapeHTML(fallback_description) unless fallback_description.empty?
  compact_lines << ''
  compact_lines << %(<a href="#{CGI.escapeHTML(post[:url])}">Read the blog</a>)
  compact_lines.join("\n")
end

def send_telegram_request(uri, payload)
  response = Net::HTTP.post_form(uri, payload)
  body = JSON.parse(response.body)
  return if response.is_a?(Net::HTTPSuccess) && body['ok']

  abort("Telegram API error: #{response.code} #{response.message} #{response.body}")
end

posts = build_posts

if posts.empty?
  puts 'No published blog posts changed, skipping Telegram notification.'
  exit 0
end

if ENV.fetch('DRY_RUN', '').strip == '1'
  puts JSON.pretty_generate(posts)
  exit 0
end

bot_token = ENV.fetch('TELEGRAM_BOT_TOKEN') do
  abort('Missing TELEGRAM_BOT_TOKEN secret.')
end

chat_id = ENV.fetch('TELEGRAM_CHAT_ID') do
  abort('Missing TELEGRAM_CHAT_ID secret.')
end

message_thread_id = ENV.fetch('TELEGRAM_MESSAGE_THREAD_ID', '').strip

posts.each do |post|
  common_payload = { 'chat_id' => chat_id }
  common_payload['message_thread_id'] = message_thread_id unless message_thread_id.empty?

  if post[:image_url]
    payload = common_payload.merge(
      'photo' => post[:image_url],
      'caption' => build_photo_caption(post),
      'parse_mode' => 'HTML'
    )
    send_telegram_request(telegram_api_uri(bot_token, 'sendPhoto'), payload)
  else
    payload = common_payload.merge(
      'text' => build_message(post),
      'parse_mode' => 'HTML'
    )
    send_telegram_request(telegram_api_uri(bot_token, 'sendMessage'), payload)
  end

  puts "Sent Telegram notification for #{post[:url]}"
end
