<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class PaginationService
{
    public static function paginate(Builder $query, $page = 1, $limit = 10)
    {
        $limit = max(1, min(100, $limit));
        $page = max(1, $page);
        
        $queryHash = md5($query->toSql() . serialize($query->getBindings()));
        $cacheKey = "pagination_{$queryHash}_{$page}_{$limit}";
        
        return Cache::remember($cacheKey, 30, function() use ($query, $page, $limit) {
            $total = $query->count();
            $totalPages = ceil($total / $limit);
            
            if ($page > $totalPages && $totalPages > 0) {
                $page = $totalPages;
            }
            
            $offset = ($page - 1) * $limit;
            $data = $query->offset($offset)->limit($limit)->get();
            
            return [
                'data' => $data,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_records' => $total,
                    'per_page' => $limit,
                    'has_next' => $page < $totalPages,
                    'has_previous' => $page > 1
                ]
            ];
        });
    }
    
    public static function clearCache($pattern = 'pagination_*')
    {
        $keys = Cache::get('pagination_keys', []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Cache::forget('pagination_keys');
    }
}