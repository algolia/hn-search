class ItemSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :created_at_i, :type, :author, :title, :url, :text, :points

  has_many :children
  has_many :options

  def type
    object.item_type
  end

  def created_at_i
    created_at.to_i
  end

  def children
    object.children.order(points: :desc).where.not(item_type_cd: Item.pollopt)
  end

  def options
    object.children.where(deleted: false).where(dead: false).where(item_type_cd: Item.pollopt)
  end

  def filter(keys)
    return [:id, :children] if object.deleted || object.dead
    keys -= [:url, :title] if object.item_type == 'comment' || object.item_type == 'pollopt'
    keys -= [:options] if object.item_type != 'poll'
    keys -= [:children, :author, :created_at] if object.item_type == 'pollopt'
    keys
  end

end
