class AddOffsetsToNodes < ActiveRecord::Migration
  def change
    add_column :nodes, :offsetTop, :integer
    add_column :nodes, :offsetLeft, :integer
  end
end
