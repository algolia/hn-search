class ItemSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :author, :title, :url, :text, :points

  has_many :children

  def type
    object.item_type
  end

  def children
    object.children.where(deleted: false).where(dead: false)
  end

  def filter(keys)
    case object.item_type
    when 'comment'
      keys -= [:url, :title]
    end
    keys
  end

end
