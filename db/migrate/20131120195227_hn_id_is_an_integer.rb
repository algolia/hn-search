class HnIdIsAnInteger < ActiveRecord::Migration
  def change
    change_column :posts, :hn_id, 'integer USING CAST(hn_id AS integer)'
  end
end
