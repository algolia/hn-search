# encoding: utf-8

require "httparty"
require "eventmachine"
require "event_machine" # Our fork
require "em-http-request"

class HackerNewsRealtimeCrawler
  def initialize
    @statsd = Statsd.new(ENV['STATSD_HOST'] || 'localhost', ENV['STATSD_PORT'] || 8125)
  end

  def crawler
    EM.run do
      @source = EventMachine::EventSource.new("#{ENV['HN_API_URL']}/v0/updates.json", headers = {"Accept" => "text/event-stream"})
      @source.on "keep-alive" do |unused|
        # just a keep-alive, do nothing. unused message is null
      end
      @source.on "put" do |put|
        msg_data = JSON.parse(put)
        refresh(msg_data['data'])
      end
      @source.on "patch" do |merge|
        msg_data = JSON.parse(merge)
        refresh(msg_data['data'])
      end
      @source.error do |error|
        puts "error: #{error}"
        @source.close
      end
      @source.open do
        #puts "opened"
      end
      @source.start
    end
  end

  def sanity_check(limit)
    # from the last `limit` items, check if some of them haven't been fetched and refresh them
    last_ids = Item.select(:id).last(limit).map { |item| item.id }.sort
    to_refresh = last_ids.first.upto(last_ids.last).to_a - last_ids
    if !to_refresh.empty?
      puts "[#{DateTime.now}] Refreshing #{to_refresh.size} missing items (#{to_refresh.inspect})"
      refresh({ 'items' => to_refresh })
    end

    # brute force just to ensure we're not missing an item
    id = last_ids.max + 1
    loop do
      begin
        break if !Item.from_api!(id)
        id += 1
      rescue
        break
      end
    end
  end

  def indexing_check
    last_hit_at = DateTime.parse(Algolia::Index.new("Item_#{Rails.env}_sort_date").search('', hitsPerPage: 1)['hits'].first['created_at']) rescue nil
    status = last_hit_at.nil? || last_hit_at < 1.hour.ago ? '0' : '1'

    @statsd.set('hn-search.indexing', status) rescue nil # not fatal
  end

  def self.refresh_home_page!
    old_front_pages = Item.where(front_page: true).select(:id).map(&:id)
    new_front_pages = SimpleRSS.parse(Net::HTTP.get(URI.parse('https://news.ycombinator.com/rss'))).items.map { |item| item[:comments].split('=').last.to_i }

    Item.where(id: old_front_pages).update_all front_page: false
    Item.where(id: new_front_pages).update_all front_page: true
    Item.where(id: (old_front_pages + new_front_pages)).reindex!
  end

  private

  def refresh(data = {})
    (data['items'] || []).each do |id|
      next if id.to_i < 9000000 # temporary to work-around https://github.com/algolia/hn-search/issues/56
      puts "[#{DateTime.now}] Refreshing item=#{id}"
      Item.delay.from_api!(id)
    end
    (data['profiles'] || []).each do |id|
      puts "[#{DateTime.now}] Refreshing user=#{id}"
      User.delay.from_api!(id)
    end
    @statsd.set('hn-search.crawling', 1) rescue nil # not fatal
  end
end