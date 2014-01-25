class MissingIndexOnParentId < ActiveRecord::Migration
  def change
    add_index :items, :parent_id
  end
end
