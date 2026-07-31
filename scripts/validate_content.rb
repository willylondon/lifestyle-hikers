#!/usr/bin/env ruby

require "date"
require "yaml"

ROOT = File.expand_path("..", __dir__)
errors = []

def load_yaml(path)
  YAML.safe_load(
    File.read(path, encoding: "UTF-8"),
    permitted_classes: [Date, Time],
    aliases: true
  )
end

Dir[File.join(ROOT, "_data", "*.{yml,yaml}")].sort.each do |path|
  load_yaml(path)
rescue StandardError => error
  errors << "#{path.delete_prefix("#{ROOT}/")}: #{error.message}"
end

published_routes = Hash.new { |hash, key| hash[key] = [] }
Dir[File.join(ROOT, "_posts", "*")].sort.each do |path|
  next unless File.file?(path)

  source = File.read(path, encoding: "UTF-8")
  match = source.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  unless match
    errors << "#{path.delete_prefix("#{ROOT}/")}: missing valid front matter delimiters"
    next
  end

  data = YAML.safe_load(
    match[1],
    permitted_classes: [Date, Time],
    aliases: true
  ) || {}
  next if data["published"] == false

  filename_slug = File.basename(path).sub(/\A\d{4}-\d{2}-\d{2}-/, "").sub(/\.[^.]+\z/, "")
  route = data["permalink"] || "/blog/#{data["slug"] || filename_slug}/"
  published_routes[route] << path.delete_prefix("#{ROOT}/")
rescue StandardError => error
  errors << "#{path.delete_prefix("#{ROOT}/")}: #{error.message}"
end

published_routes.each do |route, paths|
  errors << "duplicate published route #{route}: #{paths.join(', ')}" if paths.length > 1
end

trails = load_yaml(File.join(ROOT, "_data", "trails.yml")).fetch("items", [])
trail_slugs = trails.map { |trail| trail["slug"] }.compact
errors << "_data/trails.yml: trail slugs must be present and unique" unless trail_slugs.length == trails.length && trail_slugs.uniq.length == trails.length

events = load_yaml(File.join(ROOT, "_data", "events.yml")).fetch("items", [])
events.each_with_index do |event, index|
  %w[name date location].each do |field|
    errors << "_data/events.yml item #{index + 1}: missing #{field}" if event[field].to_s.strip.empty?
  end
end

stats = load_yaml(File.join(ROOT, "_config.yml")).fetch("stats", {})
stats.each do |name, value|
  errors << "_data/homepage.yml stats.#{name}: cannot be negative" if value.is_a?(Numeric) && value.negative?
end

if errors.empty?
  puts "Content validation passed: #{trails.length} trails, #{events.length} events, #{published_routes.length} published post routes."
  exit 0
end

warn errors.join("\n")
exit 1
