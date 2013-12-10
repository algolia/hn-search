class AvgIsAFloat < ActiveRecord::Migration
  def up
    change_column :users, :avg, :float
  end

  def down
    change_column :users, :avg, :integer
  end
end
