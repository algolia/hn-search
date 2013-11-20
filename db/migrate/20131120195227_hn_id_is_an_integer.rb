class HnIdIsAnInteger < ActiveRecord::Migration
  def change
    change_column :posts, :hn_id, :integer
  end
end
