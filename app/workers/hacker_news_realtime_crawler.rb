class HackerNewsRealtimeCrawler

  MIN_REFRESH_DELAY = 10
  REFRESH_CYCLE = 48
  LIMIT = 1000

  def self.cron
    all_items = []

    6.times do
      last_id = Item.order('id DESC').first.try(:id) || 1

      now = DateTime.now
      sec = now.second / MIN_REFRESH_DELAY * MIN_REFRESH_DELAY
      last_id -= case sec
      when 0, 20, 40
        # refresh news from last_id
        0
      else
        # refresh news from last_id-n*LIMIT -> (last_id-n*LIMIT)+LIMIT
        n = (now.minute * 6 + sec / 10) / 2 % REFRESH_CYCLE
        n * LIMIT
      end

      items = Item.refresh_since!(last_id)
      Item.where(id: items.map { |i| i.id }).reindex!

      all_items += items

      sleep 10
    end

    # resolve parents and crawl thumbnails
    Item.without_auto_index do
      all_items.each do |item|
        item.delay.crawl_thumbnail! # can be slow
        item.resolve_parent!
        item.save
      end
    end
    Item.where(id: all_items.map { |i| i.id }).reindex!
  end

end
