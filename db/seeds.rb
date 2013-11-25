Post.delete_all
Post.clear_index!
Post.without_auto_index do
  ActiveRecord::Base.transaction do
    reader = Bzip2::Reader.new File.open(File.join(Rails.root, "db/export.json.bz2"))
    n = 0
    while (line = reader.readline rescue nil)
      line.strip!
      next if line == '' || line == '[' || line == ']'
      Post.from_json!(JSON.parse(line.gsub(/,$/, '')), true)
      puts n if (n += 1) % 10000 == 0
    end
  end
end
Post.reindex!(10000)
