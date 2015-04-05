class ChangePrivateForNodes < ActiveRecord::Migration

  def change
    rename_column :nodes, :private, :status
    change_column :nodes, :status, :string
  end
end
