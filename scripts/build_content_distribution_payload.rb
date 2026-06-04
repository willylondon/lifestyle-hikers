#!/usr/bin/env ruby
# frozen_string_literal: true

require "date"
require "json"
require "optparse"
require "uri"
require "yaml"

options = {
  root: Dir.pwd,
  changed_files: []
}

OptionParser.new do |opts|
  opts.on("--root PATH", "Repository root") { |value| options[:root] = value }
  opts.on("--changed-files FILES", "Newline-separated changed files") do |value|
    options[:changed_files] = value.to_s.split(/\r?\n/).map(&:strip).reject(&:empty?)
  end
end.parse!

ROOT = File.expand_path(options[:root])
configured_site_url = ENV["LIFESTYLE_HIKERS_SITE_URL"].to_s.strip
SITE_URL = (configured_site_url.empty? ? "https://www.lifestylehikers.com" : configured_site_url).sub(%r{/\z}, "")
SOURCE_SHA = ENV["GITHUB_SHA"].to_s
RAW_REPO_URL = "https://raw.githubusercontent.com/willylondon/lifestyle-hikers"

def slugify(value)
  value.to_s.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-|-+\z/, "")
end

def full_url(value)
  return nil if value.nil? || value.to_s.strip.empty?

  path = value.to_s.strip
  return path if path.match?(%r{\Ahttps?://}i)

  "#{SITE_URL}/#{escape_url_path(path.sub(%r{\A/+}, ""))}"
end

def escape_url_path(path)
  path.to_s.split("/").map { |segment| URI::DEFAULT_PARSER.escape(segment) }.join("/")
end

def add_distribution_aliases(payload)
  send_to_telegram = payload["send_to_telegram"]
  send_to_brevo = payload["send_to_brevo"]
  channels = []
  channels << "telegram" if send_to_telegram
  channels << "brevo" if send_to_brevo

  payload.merge(
    "contentType" => payload["content_type"],
    "channels" => channels,
    "telegram" => send_to_telegram,
    "send_telegram" => send_to_telegram,
    "sendTelegram" => send_to_telegram,
    "brevo" => send_to_brevo,
    "send_brevo" => send_to_brevo,
    "sendBrevo" => send_to_brevo
  )
end

def raw_file_url(value)
  return nil if value.nil? || value.to_s.strip.empty?

  path = value.to_s.strip
  return path if path.match?(%r{\Ahttps?://}i)
  return full_url(path) if SOURCE_SHA.empty?

  "#{RAW_REPO_URL}/#{SOURCE_SHA}/#{escape_url_path(path.sub(%r{\A/+}, ""))}"
end

def date_string(value)
  return nil if value.nil? || value.to_s.strip.empty?
  return value.iso8601 if value.respond_to?(:iso8601)

  Date.parse(value.to_s).iso8601
rescue ArgumentError
  value.to_s
end

def past_date?(value)
  return false if value.nil? || value.to_s.strip.empty?

  Date.parse(value.to_s) < Date.today
rescue ArgumentError
  false
end

def bool_value(value, default)
  return default if value.nil?
  return value if value == true || value == false

  %w[true yes 1].include?(value.to_s.downcase)
end

def excerpt_from_body(body)
  body.to_s
      .gsub(/```.*?```/m, "")
      .gsub(/!\[[^\]]*\]\([^)]+\)/, "")
      .gsub(/\[[^\]]+\]\([^)]+\)/) { |match| match[/\[(.*?)\]/, 1] || match }
      .gsub(/[#>*_`-]/, " ")
      .split(/\s+/)
      .first(36)
      .join(" ")
end

def read_post(path)
  raw = File.read(path, encoding: "UTF-8")
  match = raw.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  return [{}, raw] unless match

  [YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}, raw[match[0].length..]]
end

def required_errors(payload, required_fields)
  required_fields.select { |field| payload[field].nil? || payload[field].to_s.strip.empty? }
                 .map { |field| "missing #{field}" }
end

changed_files = options[:changed_files]
filter_by_changes = changed_files.any?
events_changed = !filter_by_changes || changed_files.include?("_data/events.yml")
changed_posts = changed_files.select { |path| path.start_with?("_posts/") && path.end_with?(".md") }

payloads = []
errors = []

if events_changed
  events_path = File.join(ROOT, "_data/events.yml")
  events = YAML.safe_load(File.read(events_path, encoding: "UTF-8"), permitted_classes: [Date, Time], aliases: true) || {}

  Array(events["items"]).each do |event|
    next unless event["distribution_status"].to_s == "ready"

    date = date_string(event["date"])
    next if past_date?(date)

    flyer_url = raw_file_url(event["flyer"])
    registration_url = full_url(event["registration_url"])

    payload = add_distribution_aliases({
      "content_type" => "hike",
      "announcement_id" => event["announcement_id"].to_s.strip.empty? ? "hike-#{slugify(event["name"])}-#{date}" : event["announcement_id"].to_s.strip,
      "name" => event["name"],
      "title" => event["name"],
      "date" => date,
      "time" => event["time"],
      "location" => event["location"],
      "difficulty" => event["difficulty"],
      "distance" => event["distance"],
      "spots" => event["spots"],
      "description" => event["description"],
      "flyer_url" => flyer_url,
      "flyer" => flyer_url,
      "image_url" => flyer_url,
      "image" => flyer_url,
      "registration_url" => registration_url,
      "url" => registration_url,
      "link" => registration_url,
      "send_to_telegram" => bool_value(event["send_to_telegram"], true),
      "send_to_brevo" => bool_value(event["send_to_brevo"], true),
      "source_file" => "_data/events.yml",
      "source_commit_sha" => SOURCE_SHA
    })

    missing = required_errors(payload, %w[content_type announcement_id name date time location description])
    missing.empty? ? payloads << payload : errors << "#{payload["announcement_id"]}: #{missing.join(", ")}"
  end
end

post_paths = if filter_by_changes
               changed_posts.map { |path| File.join(ROOT, path) }.select { |path| File.file?(path) }
             else
               Dir[File.join(ROOT, "_posts", "*.md")]
             end

post_paths.each do |post_path|
  frontmatter, body = read_post(post_path)
  next unless frontmatter["distribution_status"].to_s == "ready"

  source_file = post_path.delete_prefix("#{ROOT}/")
  slug = frontmatter["slug"].to_s.strip
  slug = File.basename(post_path, ".md").sub(/\A\d{4}-\d{2}-\d{2}-/, "") if slug.empty?
  date = date_string(frontmatter["date"])
  permalink = frontmatter["permalink"].to_s.strip
  url_path = permalink.empty? ? "/blog/#{slug}/" : permalink
  description = frontmatter["description"].to_s.strip
  description = excerpt_from_body(body) if description.empty?

  image_url = raw_file_url(frontmatter["image"])

  payload = add_distribution_aliases({
    "content_type" => "blog",
    "announcement_id" => frontmatter["announcement_id"].to_s.strip.empty? ? "blog-#{date}-#{slugify(slug)}" : frontmatter["announcement_id"].to_s.strip,
    "title" => frontmatter["title"],
    "date" => date,
    "url" => full_url(url_path),
    "link" => full_url(url_path),
    "description" => description,
    "image_url" => image_url,
    "image" => image_url,
    "flyer_url" => image_url,
    "flyer" => image_url,
    "category" => frontmatter["category"],
    "tags" => Array(frontmatter["tags"]),
    "send_to_telegram" => bool_value(frontmatter["send_to_telegram"], true),
    "send_to_brevo" => bool_value(frontmatter["send_to_brevo"], false),
    "source_file" => source_file,
    "source_commit_sha" => SOURCE_SHA
  })

  missing = required_errors(payload, %w[content_type announcement_id title date url])
  missing.empty? ? payloads << payload : errors << "#{payload["announcement_id"]}: #{missing.join(", ")}"
end

unless errors.empty?
  warn "Ready content has validation errors:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts JSON.pretty_generate(payloads)
