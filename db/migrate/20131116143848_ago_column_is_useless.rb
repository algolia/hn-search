class AgoColumnIsUseless < ActiveRecord::Migration
  def up
    remove_column :posts, :ago
  end

  def down
    add_column :posts, :ago, :string
  end
end
