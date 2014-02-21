class AddIndexOnAuthor < ActiveRecord::Migration
  def change
    add_index :items, :author
  end
end
