require 'test_helper'

class NodeTest < ActiveSupport::TestCase

  def setup
    @user = users(:michael)
     @node = @user.nodes.build(name: "Node name", content: "Node desc", nodetype: "graph")
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
