class AdminItemSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :deleted, :dead, :author, :title, :url, :text, :points, :parent_id

  has_many :children, serializer: AdminItemSerializer

  def type
    object.item_type
  end

end
