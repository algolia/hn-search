class AddIndexOnHnId < ActiveRecord::Migration
  def change
    add_index :posts, :hn_id
  end
end
