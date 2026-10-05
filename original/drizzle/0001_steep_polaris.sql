ALTER TABLE `notebooks` ADD `deleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `starter_cat` integer;--> statement-breakpoint
ALTER TABLE `profiles` ADD `starter_chosen` integer DEFAULT 0 NOT NULL;