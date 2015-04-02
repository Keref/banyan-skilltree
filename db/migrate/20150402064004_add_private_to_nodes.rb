class AddPrivateToNodes < ActiveRecord::Migration
  def change
    add_column :nodes, :private, :boolean
  end
end
