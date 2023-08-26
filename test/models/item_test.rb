require 'test_helper'

class ItemTest < ActiveSupport::TestCase
  test "handle truncated URL" do
    link_url = "https:&#x2F;&#x2F;www.theatlantic.com&#x2F;magazine&#x2F;archive&#x2F;2015&#x2F;12&#x2F;the-silicon-valley-suicides&#x2F;413140&#x2F;"
    link_tag = "<a href=\"#{link_url}\" rel=\"nofollow\">#{link_url.truncate(10, omission: '...')}</a>"
    item = Item.new(item_type_cd: Item.comment)
    assert_nil item.comment_text
    assert_nil item.story_text
    
    item.text = "foo bar #{link_tag} baz"
    assert_equal "foo bar #{link_url} baz", item.comment_text
    assert_nil item.story_text

    item.text = "#{link_tag} foo #{link_tag}"
    assert_equal "#{link_url} foo #{link_url}", item.comment_text
  end
end
