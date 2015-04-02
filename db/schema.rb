# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150402064004) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "nodelinks", force: :cascade do |t|
    t.text     "Node"
    t.text     "name"
    t.text     "content"
    t.text     "linktype"
    t.integer  "node_id"
    t.integer  "targetnode_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

  add_index "nodelinks", ["node_id"], name: "index_nodelinks_on_node_id", using: :btree
  add_index "nodelinks", ["targetnode_id"], name: "index_nodelinks_on_targetnode_id", using: :btree

  create_table "nodes", force: :cascade do |t|
    t.text     "name"
    t.text     "content"
    t.integer  "user_id"
    t.text     "nodetype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "offsetTop"
    t.integer  "offsetLeft"
    t.text     "icon"
    t.boolean  "private"
  end

  add_index "nodes", ["user_id"], name: "index_nodes_on_user_id", using: :btree

  create_table "taggings", force: :cascade do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context",       limit: 128
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true, using: :btree
  add_index "taggings", ["taggable_id", "taggable_type", "context"], name: "index_taggings_on_taggable_id_and_taggable_type_and_context", using: :btree

  create_table "tags", force: :cascade do |t|
    t.string  "name"
    t.integer "taggings_count", default: 0
  end

  add_index "tags", ["name"], name: "index_tags_on_name", unique: true, using: :btree

  create_table "users", force: :cascade do |t|
    t.text     "name"
    t.text     "email"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.text     "password_digest"
    t.text     "remember_digest"
    t.boolean  "admin"
    t.text     "activation_digest"
    t.boolean  "activated"
    t.datetime "activated_at"
    t.text     "reset_digest"
    t.datetime "reset_sent_at"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree

end
