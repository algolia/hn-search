# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
# Environment variables (ENV['...']) can be set in the file config/application.yml.
# See http://railsapps.github.io/rails-environment-variables.html

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
