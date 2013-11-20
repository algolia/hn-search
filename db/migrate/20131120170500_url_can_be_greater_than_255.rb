class UrlCanBeGreaterThan255 < ActiveRecord::Migration
  def change
    change_column :posts, :url, :string, limit: 1024
  end
end
