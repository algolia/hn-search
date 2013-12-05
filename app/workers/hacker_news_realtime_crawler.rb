class HackerNewsRealtimeCrawler

  MIN_REFRESH_DELAY = 10
  REFRESH_CYCLE = 48
  LIMIT = 1000
  CURSOR_FILE = '/tmp/hnsearch_cursor'

  def self.cron
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
        n = File.read(CURSOR_FILE).to_i rescue 0
        n = 0 if n >= REFRESH_CYCLE
        File.open(CURSOR_FILE, 'w') { |f| f << (n + 1).to_s }
        n * LIMIT
      end

      items = Item.refresh_since!(last_id)
      Item.where(id: items.map { |i| i.id }).reindex!

      sleep 10
    end
  end

end
