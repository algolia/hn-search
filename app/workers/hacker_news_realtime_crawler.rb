class HackerNewsRealtimeCrawler

  REFRESH_CYCLE = 48
  LIMIT = 1000
  CURSOR_FILE = '/tmp/hnsearch_cursor'
  REINDEX_LAST_STORIES = 5000

  def self.cron
    last_id = Item.order('id DESC').first.try(:id) || 1

    last_id -= if DateTime.now.minute % 2 == 0
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
      item_ids = Item.refresh_since!(last_id).map { |i| i.id }
      Item.where(id: item_ids).where(deleted: false).where(dead: false).reindex!
      Item.where(id: item_ids).where('deleted = ? OR dead = ?', true, true).find_each do |item|
        item.remove_from_index!
      end
    rescue Exception => e
      puts "Failed to refresh #{last_id}: #{e}"
    end

    # reindex last 5000 items
    first = Item.where(item_type_cd: Item.story).order('id DESC').limit(REINDEX_LAST_STORIES).select('id').last
    Item.where(item_type_cd: Item.story).where(deleted: false).where(dead: false).where('id > ?', first.id).reindex!
  end


end
