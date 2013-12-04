class HackerNewsRealtimeCrawler

  MIN_REFRESH_DELAY = 10
  REFRESH_CYCLE = 48
  LIMIT = 1000

  def self.cron
    threads = []

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

      threads << Thread.new { Item.refresh_since!(last_id) }

      sleep 10
    end

    threads.each { |t| t.join }
  end

end
