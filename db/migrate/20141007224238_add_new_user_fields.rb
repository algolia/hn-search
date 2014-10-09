class AddNewUserFields < ActiveRecord::Migration
  def change
    add_column :users, :delay, :integer
    add_column :users, :submitted, :integer, null: false, default: 0
  end
end
