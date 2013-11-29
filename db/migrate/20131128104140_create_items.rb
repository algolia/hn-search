class CreateItems < ActiveRecord::Migration
  def change
    create_table :items do |t|
      t.integer :item_type_cd, null: false
      t.string :author, null: false
      t.datetime :created_at, null: false
      t.boolean :deleted, null: false, default: false
      t.boolean :dead, null: false, default: false
      t.string :title
      t.text :url
      t.text :text
      t.integer :points
      t.integer :parent_id
      t.integer :story_id
    end
    add_index :items, :item_type_cd
    add_index :items, :deleted
    add_index :items, :dead
    add_index :items, :story_id
  end
end
