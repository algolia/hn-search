class AdminItemSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :type, :deleted, :dead, :author, :title, :url, :text, :points, :parent_id

  has_many :children, serializer: AdminItemSerializer
  has_many :options, serializer: AdminItemSerializer

  def type
    object.item_type
  end

  def children
    object.children.order(points: :desc).where.not(item_type_cd: Item.pollopt)
  end

  def options
    object.children.where(item_type_cd: Item.pollopt)
  end

  def filter(keys)
    keys -= [:options] if object.item_type != 'poll'
    keys
  end

end
