class UserSerializer < ActiveModel::Serializer
  attributes :username, :karma, :about
end
