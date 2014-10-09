class AddUpdatedAtFields < ActiveRecord::Migration
  def change
    add_column :users, :updated_at, :datetime
    add_column :items, :updated_at, :datetime
    add_index :users, :updated_at
    add_index :items, :updated_at
  end
end
