CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`hash` text NOT NULL,
	`key` text NOT NULL,
	`mime` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_assets_owner` ON `assets` (`owner`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`owner` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_comments_post_created` ON `comments` (`post_id`,`created`);--> statement-breakpoint
CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`book_id` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`document` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_entries_owner_date` ON `entries` (`owner`,`date`);--> statement-breakpoint
CREATE INDEX `idx_entries_book` ON `entries` (`book_id`);--> statement-breakpoint
CREATE TABLE `friends` (
	`id` text PRIMARY KEY NOT NULL,
	`sender` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_friends_pair` ON `friends` (`sender`,`recipient`);--> statement-breakpoint
CREATE INDEX `idx_friends_recipient` ON `friends` (`recipient`,`status`);--> statement-breakpoint
CREATE TABLE `likes` (
	`post_id` text NOT NULL,
	`owner` text NOT NULL,
	PRIMARY KEY(`post_id`, `owner`)
);
--> statement-breakpoint
CREATE TABLE `notebooks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`color` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notebooks_owner` ON `notebooks` (`owner`);--> statement-breakpoint
CREATE TABLE `photo_credits` (
	`owner` text NOT NULL,
	`hash` text NOT NULL,
	PRIMARY KEY(`owner`, `hash`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`body` text NOT NULL,
	`visibility` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_posts_visibility_created` ON `posts` (`visibility`,`created`);--> statement-breakpoint
CREATE INDEX `idx_posts_owner_created` ON `posts` (`owner`,`created`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`cat` integer DEFAULT 0 NOT NULL,
	`last_activity` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_profiles_code` ON `profiles` (`code`);