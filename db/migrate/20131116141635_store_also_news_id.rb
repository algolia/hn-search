class StoreAlsoNewsId < ActiveRecord::Migration
  def change
    add_column :posts, :hn_id, :string
  end
end
