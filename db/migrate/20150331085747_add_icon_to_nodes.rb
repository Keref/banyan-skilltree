class AddIconToNodes < ActiveRecord::Migration
  def change
    add_column :nodes, :icon, :string
  end
end
