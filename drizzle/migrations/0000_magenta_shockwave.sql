CREATE TABLE `departments` (
	`dept_no` char(4) NOT NULL,
	`dept_name` varchar(40) NOT NULL,
	CONSTRAINT `departments_dept_no` PRIMARY KEY(`dept_no`),
	CONSTRAINT `departments_dept_name_unique` UNIQUE(`dept_name`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`emp_no` int NOT NULL,
	`birth_date` date NOT NULL,
	`first_name` varchar(14) NOT NULL,
	`last_name` varchar(16) NOT NULL,
	`gender` enum('M','F') NOT NULL,
	`hire_date` date NOT NULL,
	CONSTRAINT `employees_emp_no` PRIMARY KEY(`emp_no`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`full_name` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
