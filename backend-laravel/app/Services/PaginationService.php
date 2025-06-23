<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;

class PaginationService
{
    public static function paginate(Builder $query, $page = 1, $limit = 10)
    {
        $limit = max(1, min(100, $limit));
        $page = max(1, $page);
        
        $total = $query->count();
        $totalPages = ceil($total / $limit);
        
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
    }
}