# Terraform AWS Architecture for OpsPulse AI
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "production"
}

# S3 Bucket for Raw Parquet Lakehouse Data
resource "aws_s3_bucket" "lakehouse_raw" {
  bucket        = "opspulse-lakehouse-raw-${var.environment}"
  force_destroy = false
}

# ECS Cluster (Fargate Serverless)
resource "aws_ecs_cluster" "opspulse_cluster" {
  name = "opspulse-ai-${var.environment}"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "opspulse_logs" {
  name              = "/ecs/opspulse-ai"
  retention_in_days = 14
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.opspulse_cluster.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.lakehouse_raw.id
}
