class CreateNodelinks < ActiveRecord::Migration
  def change
    create_table :nodelinks do |t|
      t.string :Node
      t.text :name
      t.text :content
      t.text :linktype
      t.references :node, index: true
      t.references :targetnode, index: true

      t.timestamps null: false
    end
    add_foreign_key :nodelinks, :nodes
    add_foreign_key :nodelinks, :targetnodes
  end
end
