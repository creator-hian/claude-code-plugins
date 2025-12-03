#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Claude Code Plugin Creator
Creates a new plugin from the plugin-template with interactive CLI.
"""

import os
import sys
import shutil
import json
from pathlib import Path


class PluginCreator:
    def __init__(self):
        self.script_dir = Path(__file__).parent.absolute()  # tools/
        self.project_root = self.script_dir.parent  # project root
        self.template_dir = self.script_dir / "plugin-template"  # tools/plugin-template
        self.marketplace_file = self.project_root / ".claude-plugin" / "marketplace.json"

    def validate_environment(self):
        """Validate that template and marketplace.json exist."""
        if not self.template_dir.exists():
            print(f"❌ Error: Template directory not found at {self.template_dir}")
            return False

        if not self.marketplace_file.exists():
            print(f"❌ Error: marketplace.json not found at {self.marketplace_file}")
            return False

        return True

    def get_user_input(self):
        """Interactive CLI to gather plugin information."""
        print("\n" + "="*60)
        print("   Claude Code Plugin Creator")
        print("="*60 + "\n")

        # Plugin name
        while True:
            name = input("Plugin name (kebab-case, e.g., my-plugin): ").strip()
            if not name:
                print("❌ Plugin name cannot be empty!")
                continue
            if " " in name:
                print("❌ Plugin name should not contain spaces (use kebab-case)")
                continue
            if (self.project_root / name).exists():
                print(f"❌ Directory '{name}' already exists!")
                continue
            break

        # Description
        while True:
            description = input("Description: ").strip()
            if not description:
                print("❌ Description cannot be empty!")
                continue
            break

        # Author
        while True:
            author = input("Author name: ").strip()
            if not author:
                print("❌ Author name cannot be empty!")
                continue
            break

        # Version
        version = input("Version [1.0.0]: ").strip()
        if not version:
            version = "1.0.0"

        return {
            "name": name,
            "description": description,
            "author": author,
            "version": version
        }

    def create_plugin_directory(self, plugin_info):
        """Copy template directory to new plugin directory."""
        plugin_name = plugin_info["name"]
        target_dir = self.project_root / plugin_name

        print(f"\n📁 Creating plugin directory: {plugin_name}")

        try:
            shutil.copytree(self.template_dir, target_dir)
            print(f"✅ Directory created successfully")
            return target_dir
        except Exception as e:
            print(f"❌ Error creating directory: {e}")
            return None

    def update_plugin_json(self, target_dir, plugin_info):
        """Update plugin.json with user-provided information."""
        plugin_json_path = target_dir / ".claude-plugin" / "plugin.json"

        print(f"\n📝 Updating plugin.json")

        try:
            # Read existing plugin.json
            with open(plugin_json_path, 'r', encoding='utf-8') as f:
                plugin_data = json.load(f)

            # Update with new information
            plugin_data["name"] = plugin_info["name"]
            plugin_data["description"] = plugin_info["description"]
            plugin_data["version"] = plugin_info["version"]
            plugin_data["author"]["name"] = plugin_info["author"]

            # Write updated plugin.json
            with open(plugin_json_path, 'w', encoding='utf-8') as f:
                json.dump(plugin_data, f, indent=2, ensure_ascii=False)

            print(f"✅ plugin.json updated successfully")
            return True
        except Exception as e:
            print(f"❌ Error updating plugin.json: {e}")
            return False

    def register_to_marketplace(self, plugin_info):
        """Register the plugin to marketplace.json if user confirms."""
        print(f"\n🏪 Marketplace Registration")

        while True:
            choice = input("Register this plugin to marketplace.json? (y/n): ").strip().lower()
            if choice in ['y', 'n']:
                break
            print("❌ Please enter 'y' or 'n'")

        if choice == 'n':
            print("⏭️  Skipped marketplace registration")
            return True

        try:
            # Read marketplace.json
            with open(self.marketplace_file, 'r', encoding='utf-8') as f:
                marketplace_data = json.load(f)

            # Check if plugin already exists
            existing_plugins = [p["name"] for p in marketplace_data.get("plugins", [])]
            if plugin_info["name"] in existing_plugins:
                print(f"⚠️  Plugin '{plugin_info['name']}' already exists in marketplace.json")
                return True

            # Add new plugin
            new_plugin_entry = {
                "name": plugin_info["name"],
                "source": f"./{plugin_info['name']}",
                "description": plugin_info["description"]
            }

            if "plugins" not in marketplace_data:
                marketplace_data["plugins"] = []

            marketplace_data["plugins"].append(new_plugin_entry)

            # Write updated marketplace.json
            with open(self.marketplace_file, 'w', encoding='utf-8') as f:
                json.dump(marketplace_data, f, indent=2, ensure_ascii=False)

            print(f"✅ Plugin registered to marketplace.json")
            return True
        except Exception as e:
            print(f"❌ Error updating marketplace.json: {e}")
            return False

    def print_success_message(self, plugin_info):
        """Print success message with next steps."""
        print("\n" + "="*60)
        print("   ✅ Plugin Created Successfully!")
        print("="*60)
        print(f"\nPlugin Name: {plugin_info['name']}")
        print(f"Location: ./{plugin_info['name']}")
        print(f"\n📖 Next Steps:")
        print(f"   1. cd {plugin_info['name']}")
        print(f"   2. Add your custom agents, commands, hooks, or skills")
        print(f"   3. Update README.md with usage instructions")
        print(f"   4. Test your plugin with Claude Code")
        print("\n🚀 Happy Plugin Development!")
        print("="*60 + "\n")

    def run(self):
        """Main execution flow."""
        # Validate environment
        if not self.validate_environment():
            return 1

        # Get user input
        plugin_info = self.get_user_input()

        # Confirm before proceeding
        print(f"\n📋 Plugin Information Summary:")
        print(f"   Name: {plugin_info['name']}")
        print(f"   Description: {plugin_info['description']}")
        print(f"   Author: {plugin_info['author']}")
        print(f"   Version: {plugin_info['version']}")

        while True:
            confirm = input("\nProceed with plugin creation? (y/n): ").strip().lower()
            if confirm in ['y', 'n']:
                break
            print("❌ Please enter 'y' or 'n'")

        if confirm == 'n':
            print("\n❌ Plugin creation cancelled")
            return 0

        # Create plugin directory
        target_dir = self.create_plugin_directory(plugin_info)
        if not target_dir:
            return 1

        # Update plugin.json
        if not self.update_plugin_json(target_dir, plugin_info):
            print(f"\n⚠️  Warning: plugin.json update failed, but directory was created")
            return 1

        # Register to marketplace (optional)
        self.register_to_marketplace(plugin_info)

        # Print success message
        self.print_success_message(plugin_info)

        return 0


def main():
    """Entry point for the script."""
    creator = PluginCreator()
    exit_code = creator.run()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
