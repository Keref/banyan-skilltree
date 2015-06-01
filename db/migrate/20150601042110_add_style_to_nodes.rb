class AddStyleToNodes < ActiveRecord::Migration
  def change
    add_column :nodes, :style, :string
  end
end
