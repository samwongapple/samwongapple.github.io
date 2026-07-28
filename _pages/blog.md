---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
---

{% comment %}
  Posts are grouped by thread (post `category`) rather than listed by date, because each
  thread is a series read front-to-back — post 2 opens on post 1's hook, so a newest-first
  list would show them in reverse reading order.

  Thread names, blurbs and order live in `_data/blog_threads.yml`. Empty threads are
  skipped. Posts whose category is not a declared thread fall through to "Other notes" so
  nothing is silently dropped.
{% endcomment %}

<style>
  .thread {
    margin-bottom: 3rem;
  }
  .thread-head {
    border-bottom: 1px solid var(--global-divider-color);
    padding-bottom: 0.4rem;
    margin-bottom: 0.35rem;
  }
  .thread-head h2 {
    margin: 0;
    font-size: 1.35rem;
    color: var(--global-theme-color);
  }
  .thread-count {
    font-size: 0.8rem;
    color: var(--global-text-color-light);
    white-space: nowrap;
  }
  .thread-blurb {
    color: var(--global-text-color-light);
    font-size: 0.95rem;
    margin: 0 0 1.1rem;
  }
  ol.thread-posts {
    list-style: none;
    padding-left: 0;
    margin: 0;
    counter-reset: postnum;
  }
  ol.thread-posts > li {
    counter-increment: postnum;
    display: grid;
    grid-template-columns: 2.1rem 1fr;
    gap: 0.2rem 0.6rem;
    margin-bottom: 1.5rem;
  }
  ol.thread-posts > li::before {
    content: counter(postnum);
    grid-row: 1 / span 3;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--global-theme-color);
    opacity: 0.55;
    text-align: right;
    line-height: 1.4;
  }
  ol.thread-posts .post-title {
    font-size: 1.1rem;
  }
  ol.thread-posts p {
    margin: 0.15rem 0 0;
  }
  @media (max-width: 576px) {
    ol.thread-posts > li {
      grid-template-columns: 1.5rem 1fr;
    }
  }
</style>

<div class="post">
  <div class="header-bar">
    <h1>{{ site.blog_name }}</h1>
    <h2>{{ site.blog_description }}</h2>
  </div>

  {% if site.display_tags and site.display_tags.size > 0 %}
    <div class="tag-category-list">
      <ul class="p-0 m-0">
        {% for tag in site.display_tags %}
          <li>
            <i class="fa-solid fa-hashtag fa-sm"></i> <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">{{ tag }}</a>
          </li>
          {% unless forloop.last %}
            <p>&bull;</p>
          {% endunless %}
        {% endfor %}
      </ul>
    </div>
  {% endif %}

  {%- comment -%} Track which posts a thread has claimed, so the leftovers can be found below. {%- endcomment -%}
  {% assign claimed = '' %}

  {% for thread in site.data.blog_threads %}
    {%- comment -%} Guard before sorting: an undeclared/empty category is nil, and `sort` on nil raises. {%- endcomment -%}
    {% assign thread_posts = site.categories[thread.slug] %}
    {% if thread_posts and thread_posts.size > 0 %}
      {% assign thread_posts = thread_posts | sort: 'date' %}
      <div class="thread">
        <div class="thread-head d-flex justify-content-between align-items-baseline">
          <h2 id="{{ thread.slug }}">{{ thread.name }}</h2>
          <span class="thread-count">{{ thread_posts.size }} post{% if thread_posts.size != 1 %}s{% endif %}</span>
        </div>
        {% if thread.blurb %}<p class="thread-blurb">{{ thread.blurb }}</p>{% endif %}

        <ol class="thread-posts">
          {% for post in thread_posts %}
            {% capture claim %}|{{ post.url }}|{% endcapture %}
            {% assign claimed = claimed | append: claim %}

            {% if post.external_source == blank %}
              {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
            {% else %}
              {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
            {% endif %}

            <li>
              <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
              {% if post.description %}<p>{{ post.description }}</p>{% endif %}
              <p class="post-meta">
                {{ read_time }} min read &nbsp;&middot;&nbsp; {{ post.date | date: '%B %Y' }}
                {% if post.external_source %}&nbsp;&middot;&nbsp; {{ post.external_source }}{% endif %}
              </p>
            </li>
          {% endfor %}
        </ol>
      </div>
    {% endif %}
  {% endfor %}

  {%- comment -%} Anything not claimed by a declared thread — never drop a post silently. {%- endcomment -%}
  {% assign other_count = 0 %}
  {% for post in site.posts %}
    {% capture claim %}|{{ post.url }}|{% endcapture %}
    {% unless claimed contains claim %}
      {% assign other_count = other_count | plus: 1 %}
    {% endunless %}
  {% endfor %}

  {% if other_count > 0 %}
    <div class="thread">
      <div class="thread-head d-flex justify-content-between align-items-baseline">
        <h2 id="other">Other notes</h2>
        <span class="thread-count">{{ other_count }} post{% if other_count != 1 %}s{% endif %}</span>
      </div>
      <p class="thread-blurb">Not yet part of a thread — give the post a <code>categories:</code> matching an entry in <code>_data/blog_threads.yml</code> to file it.</p>

      <ol class="thread-posts">
        {% assign leftovers = site.posts | sort: 'date' %}
        {% for post in leftovers %}
          {% capture claim %}|{{ post.url }}|{% endcapture %}
          {% unless claimed contains claim %}
            {% if post.external_source == blank %}
              {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
            {% else %}
              {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
            {% endif %}
            <li>
              <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
              {% if post.description %}<p>{{ post.description }}</p>{% endif %}
              <p class="post-meta">{{ read_time }} min read &nbsp;&middot;&nbsp; {{ post.date | date: '%B %Y' }}</p>
            </li>
          {% endunless %}
        {% endfor %}
      </ol>
    </div>
  {% endif %}
</div>
