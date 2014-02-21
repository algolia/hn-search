class UserSerializer < ActiveModel::Serializer
  attributes :username, :karma, :about, :submission_count

  def submission_count
    Item.where(author: object.username).count
  end
end
