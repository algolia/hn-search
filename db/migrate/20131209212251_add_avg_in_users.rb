class AddAvgInUsers < ActiveRecord::Migration
  def change
    add_column :users, :avg, :integer
  end
end
