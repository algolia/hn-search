class UserSerializer < ActiveModel::Serializer
  attributes :username, :karma, :about, :submission_count, :comment_count
end
