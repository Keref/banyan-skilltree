class AddMaxlevelToNodes < ActiveRecord::Migration
  def change
    add_column :nodes, :maxlevel, :integer
  end
end
