class UserSerializer < ActiveModel::Serializer
  attributes :username, :karma, :about, :delay, :submitted, :submission_count, :comment_count
end
