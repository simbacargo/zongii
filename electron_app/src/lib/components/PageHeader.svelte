<script lang="ts">
  let { title, subtitle = '' }: { title: string; subtitle?: string } = $props();
</script>

<div class="mb-6">
  <h1 class="text-2xl font-black text-gray-900">{@html title}</h1>
  {#if subtitle}
    <p class="text-sm text-gray-500 mt-0.5">{subtitle}</p>
  {/if}
</div>
