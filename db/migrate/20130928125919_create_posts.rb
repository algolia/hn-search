class CreatePosts < ActiveRecord::Migration
  def change
    create_table :posts do |t|
      t.string :url, null: false
      t.string :title
      t.string :source
      t.integer :best_rank
      t.integer :points
      t.string :author
      t.string :ago
      t.integer :comments
      t.timestamps
    end
  end
end
