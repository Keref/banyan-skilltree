require 'test_helper'

class NodelinkTest < ActiveSupport::TestCase

  def setup
		@node = nodes(:one)
    @link = @node.nodelinks.build(name: "Nodelink name", content: "Node desc")
  end

  test "should be valid" do
    assert @node.valid?
  end

  test "user id should be present" do
    @node.user_id = nil
    assert_not @node.valid?
  end


  test "node name should not be more than 80 chars" do
    @node.name = "a"  * 81
    assert_not @node.valid?
  end

end
