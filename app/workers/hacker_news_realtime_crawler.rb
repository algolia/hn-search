class HackerNewsRealtimeCrawler

  REFRESH_CYCLE = 48
  LIMIT = 1000
  CURSOR_FILE = '/tmp/hnsearch_cursor'

  def self.cron
    last_id = Item.order('id DESC').first.try(:id) || 1

    last_id -= if DateTime.now.minute % 4 == 0
      # refresh news from last_id-(LIMIT / 2)
      LIMIT / 2
    else
      # refresh news from last_id-n*LIMIT -> (last_id-n*LIMIT)+LIMIT
      n = File.read(CURSOR_FILE).to_i rescue 0
      n = 0 if n >= REFRESH_CYCLE
      File.open(CURSOR_FILE, 'w') { |f| f << (n + 1).to_s }
      n * LIMIT
    end

    begin
      items = Item.refresh_since!(last_id)
      Item.where(id: items.map { |i| i.id }).reindex!
    rescue Exception => e
      puts "Failed to refresh #{last_id}: #{e}"
    end
  end

  # def self.cron
  #   6.times do |t|
  #     last_id = Item.order('id DESC').first.try(:id) || 1

  #     last_id -= case t
  #     when 0, 2, 4
  #       # refresh news from last_id
  #       0
  #     else
  #       # refresh news from last_id-n*LIMIT -> (last_id-n*LIMIT)+LIMIT
  #       n = File.read(CURSOR_FILE).to_i rescue 0
  #       n = 0 if n >= REFRESH_CYCLE
  #       File.open(CURSOR_FILE, 'w') { |f| f << (n + 1).to_s }
  #       n * LIMIT
  #     end

  #     begin
  #       items = Item.refresh_since!(last_id)
  #       Item.where(id: items.map { |i| i.id }).reindex!
  #     rescue Exception => e
  #       puts "Failed to refresh #{last_id}: #{e}"
  #     end

  #     sleep 10
  #   end
  # end

end
