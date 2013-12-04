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
      all_items += items

      items.each { |item| item.index! } # index ASAP

      sleep 10
    end

    # the following code can be slow
    all_items.each do |item|
      item.crawl_thumbnail! rescue "not fatal"
      item.resolve_parent!
      item.save
    end
  end

end
